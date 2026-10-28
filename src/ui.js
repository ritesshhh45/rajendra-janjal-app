import { Image } from 'expo-image';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { C } from './config';
// Ek image component: disk cache + fade, mhanun lavkar load hoto
export const Pic = ({ uri, style }) => (
  <Image source={{ uri }} style={[{ backgroundColor: C.soft }, style]} contentFit="cover" transition={150} cachePolicy="memory-disk" recyclingKey={uri} />
);
export const Title = ({ children, action }) => (
  <View style={s.row}><Text style={s.h}>{children}</Text>{action ? <Text style={s.link}>{action}</Text> : null}</View>
);
const COL = { Completed: C.ok, 'In progress': C.warn, Approved: C.primary };
export const Badge = ({ text }) => <Text style={[s.badge, { backgroundColor: COL[text] || C.primary }]}>{text}</Text>;
export const Btn = ({ label, onPress, disabled, kind }) => (
  <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [s.btn, kind === 'ghost' && s.ghost, (disabled || pressed) && { opacity: 0.6 }]}>
    <Text style={[s.btnT, kind === 'ghost' && { color: C.err }]}>{label}</Text>
  </Pressable>
);
export const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 10, paddingHorizontal: 16 },
  h: { fontSize: 19, fontWeight: '700', color: C.text }, link: { color: C.primary, fontWeight: '600' },
  badge: { color: '#fff', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  btn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }, ghost: { backgroundColor: 'transparent' },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
