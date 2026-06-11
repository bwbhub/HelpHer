// Edge Function : suppression de compte (soft-delete ou hard-delete).
// Déploiement (CLI) : npx supabase functions deploy delete-account
//   ou via le dashboard Supabase → Edge Functions → New function (coller ce code).
// La clé service_role est injectée automatiquement dans l'environnement Edge.
//
// Body : { "mode": "soft" | "hard" }  (défaut : "hard")
// - soft : deactivated_at = now + name → null (compte conservé, réactivable).
// - hard : suppression définitive du user auth ; le ON DELETE CASCADE du schéma
//   nettoie profiles + tables liées.
// Dans les deux cas : unlink mutuel du partenaire, sans jamais toucher à son compte.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Non authentifié' }, 401);
    const jwt = authHeader.replace('Bearer ', '');

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Identifie l'appelant depuis son JWT (jamais d'id passé par le client).
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData.user) return json({ error: 'Session invalide' }, 401);
    const uid = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === 'soft' ? 'soft' : 'hard';

    // Unlink mutuel — on remet à null des deux côtés, sans supprimer le partenaire.
    const { data: prof } = await admin
      .from('profiles')
      .select('partner_linked_id')
      .eq('id', uid)
      .maybeSingle();
    const partnerId = prof?.partner_linked_id ?? null;
    if (partnerId) {
      await admin.from('profiles').update({ partner_linked_id: null }).eq('id', partnerId);
    }
    await admin.from('profiles').update({ partner_linked_id: null }).eq('id', uid);

    if (mode === 'hard') {
      const { error } = await admin.auth.admin.deleteUser(uid);
      if (error) return json({ error: error.message }, 500);
    } else {
      // Soft : on conserve l'email auth pour permettre la réactivation à la reconnexion.
      await admin
        .from('profiles')
        .update({ deactivated_at: new Date().toISOString(), name: null })
        .eq('id', uid);
    }

    return json({ ok: true, mode }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
