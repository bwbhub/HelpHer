import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useT } from '../../i18n/LocaleProvider';
import { styles } from './Calendar.styles';

interface Props {
  /** Date sélectionnée au format ISO (YYYY-MM-DD). */
  value: string;
  onChange: (iso: string) => void;
  /** Empêche la sélection de dates futures (défaut : true). */
  disableFuture?: boolean;
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Calendrier maison : grille mensuelle calculée en JS, esthétique Luna. */
export default function Calendar({ value, onChange, disableFuture = true }: Props) {
  const { dict } = useT();
  const WEEKDAYS = dict.calendar.weekdays;
  const MONTHS = dict.calendar.months;
  const selected = new Date(value);
  const [view, setView] = useState({ year: selected.getFullYear(), month: selected.getMonth() });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Lundi en première colonne.
  const startOffset = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.nav} accessibilityLabel="Mois précédent">
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[view.month]} {view.year}</Text>
        <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.nav} accessibilityLabel="Mois suivant">
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (d === null) return <View key={`pad-${i}`} style={styles.cell} />;
          const iso = toISO(view.year, view.month, d);
          const isFuture = disableFuture && new Date(view.year, view.month, d) > today;
          const isSelected = iso === value;
          return (
            <TouchableOpacity
              key={iso}
              style={styles.cell}
              disabled={isFuture}
              onPress={() => onChange(iso)}
              accessibilityState={{ selected: isSelected, disabled: isFuture }}
            >
              <View style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}>
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isFuture && styles.dayTextDisabled]}>
                  {d}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
