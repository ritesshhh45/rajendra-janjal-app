import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, View, Text, TextInput, Pressable, FlatList, Linking, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CONFIG, C } from './config';
import { UPDATES, SCHEMES, WORKS } from './data';
import { useT } from './i18n';
import { useAuth } from './auth';
import * as api from './api';
import { Pic, Title, Badge, Btn } from './ui';

const Page = ({ children }) => <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>{children}</SafeAreaView>;
const input = { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, color: C.text, marginBottom: 12, borderWidth: 1, borderColor: '#F0D9C8' };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function parseDob(v) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v); if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getFullYear() !== +m[3] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[1]) return null;
  const age = (Date.now() - d) / (365.25 * 864e5); return age >= 18 && age < 110 ? `${m[3]}-${m[2]}-${m[1]}` : null;
}
export function Login() {
  const { t, lang, setLang } = useT(); const { login } = useAuth();
  const [f, setF] = useState({ name: '', mobile: '', email: '', address: '', dob: '' });
  const [agree, setAgree] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const valid = f.name.trim().length >= 2 && /^[6-9]\d{9}$/.test(f.mobile) && EMAIL.test(f.email.trim()) && f.address.trim().length >= 3 && parseDob(f.dob) && agree;
  const submit = async () => {
    setBusy(true); setErr('');
    try { const r = await api.register({ name: f.name.trim(), mobile: f.mobile, email: f.email.trim().toLowerCase(), address: f.address.trim(), dob: parseDob(f.dob) }); await login({ token: r.token }); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const dobFmt = (v) => { const d = v.replace(/\D/g, '').slice(0, 8); return d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
  return (
    <Page><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}>
        <Pressable onPress={() => setLang(lang === 'en' ? 'mr' : 'en')} style={{ alignSelf: 'flex-end' }}><Text style={{ color: C.primary, fontWeight: '700' }}>{lang === 'en' ? 'मराठी' : 'EN'}</Text></Pressable>
        <Pic uri={CONFIG.leader.photo} style={{ width: 110, height: 110, borderRadius: 55, alignSelf: 'center', marginTop: 10 }} />
        <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, marginTop: 16 }}>{t('hi')}</Text>
        <Text style={{ color: C.sub, marginBottom: 18 }}>{t('reg')}</Text>
        <TextInput style={input} placeholder={t('name')} value={f.name} maxLength={60} autoComplete="name" onChangeText={set('name')} />
        <TextInput style={input} placeholder={t('mob')} value={f.mobile} maxLength={10} keyboardType="number-pad" autoComplete="tel" onChangeText={(v) => set('mobile')(v.replace(/\D/g, ''))} />
        <TextInput style={input} placeholder={t('email')} value={f.email} maxLength={100} keyboardType="email-address" autoCapitalize="none" autoComplete="email" onChangeText={set('email')} />
        <TextInput style={input} placeholder={t('dob')} value={f.dob} maxLength={10} keyboardType="number-pad" onChangeText={(v) => set('dob')(dobFmt(v))} />
        <TextInput style={[input, { height: 80 }]} multiline placeholder={t('addr')} value={f.address} maxLength={200} onChangeText={set('address')} />
        <Pressable onPress={() => setAgree(!agree)} style={{ flexDirection: 'row', marginBottom: 14, alignItems: 'center' }}>
          <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={24} color={C.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: C.text, flex: 1 }}>{t('consent')} <Text style={{ color: C.primary }} onPress={() => Linking.openURL(CONFIG.PRIVACY_URL)}>(link)</Text></Text>
        </Pressable>
        <Btn label={busy ? '...' : t('go')} onPress={submit} disabled={!valid || busy} />
        {err ? <Text style={{ color: C.err, marginTop: 10 }}>{err}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView></Page>
  );
}

export function Home() {
  const { t } = useT(); const L = CONFIG.leader;
  return (
    <Page><ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={{ margin: 16, padding: 14, backgroundColor: C.card, borderRadius: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pic uri={L.photo} style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: C.primary }} />
          <View style={{ marginLeft: 12, flex: 1 }}><Text style={{ fontWeight: '800', fontSize: 18, color: C.text }}>{L.name}</Text><Text style={{ color: C.sub }}>{L.role}</Text><Text style={{ color: C.ok, fontStyle: 'italic', fontSize: 12 }}>{L.tagline}</Text></View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          {[['call', () => Linking.openURL(`tel:${L.phone}`), C.soft, C.primary], ['WhatsApp', () => Linking.openURL(`https://wa.me/${L.whatsapp}`), '#DDF3E4', C.ok]].map(([l, fn, bg, col]) => (
            <Pressable key={l} onPress={fn} style={{ flex: 1, backgroundColor: bg, padding: 11, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: col, fontWeight: '700' }}>{l === 'call' ? t('call') : l}</Text></Pressable>))}
        </View>
      </View>

      <Title action={t('all')}>{t('updates')}</Title>
      <FlatList horizontal data={UPDATES} keyExtractor={(i) => i.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ width: 250, backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' }}>
            <Pic uri={item.image} style={{ height: 130 }} />
            <View style={{ padding: 12 }}><Text style={{ color: C.primary, fontWeight: '700', fontSize: 12 }}>{item.tag}</Text><Text style={{ fontWeight: '700', color: C.text, fontSize: 16 }}>{item.title}</Text><Text style={{ color: C.sub }} numberOfLines={2}>{item.body}</Text></View>
          </View>)} />

      <Title action={t('all')}>{t('schemes')}</Title>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 }}>
        {SCHEMES.map((x) => (
          <View key={x.id} style={{ width: '47.5%', backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' }}>
            <Pic uri={x.image} style={{ height: 90 }} /><Text style={{ padding: 10, fontWeight: '600', color: C.text }} numberOfLines={3}>{x.title}</Text>
          </View>))}
      </View>

      <Title>{t('works')}</Title>
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {WORKS.map((w) => (
          <View key={w.id} style={{ flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, padding: 10, alignItems: 'center' }}>
            <Pic uri={w.image} style={{ width: 72, height: 72, borderRadius: 12 }} />
            <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ fontWeight: '700', color: C.text }}>{w.title}</Text><Text style={{ color: C.sub, marginVertical: 3 }} numberOfLines={1}>{w.sub}</Text><View style={{ alignSelf: 'flex-start' }}><Badge text={w.status} /></View></View>
          </View>))}
      </View>
    </ScrollView></Page>
  );
}

export function Schemes() { return <Page><Title>{useT().t('schemes')}</Title><FlatList data={SCHEMES} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16, gap: 12 }} renderItem={({ item }) => (<View style={{ backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' }}><Pic uri={item.image} style={{ height: 150 }} /><Text style={{ padding: 12, fontWeight: '700', fontSize: 16, color: C.text }}>{item.title}</Text></View>)} /></Page>; }
export function Updates() { return <Page><Title>{useT().t('updates')}</Title><FlatList data={UPDATES} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 16, gap: 12 }} renderItem={({ item }) => (<View style={{ backgroundColor: C.card, borderRadius: 16, overflow: 'hidden' }}><Pic uri={item.image} style={{ height: 150 }} /><View style={{ padding: 12 }}><Text style={{ color: C.primary, fontWeight: '700' }}>{item.tag}</Text><Text style={{ fontWeight: '700', fontSize: 17, color: C.text }}>{item.title}</Text><Text style={{ color: C.sub }}>{item.body}</Text></View></View>)} /></Page>; }

export function Profile() {
  const { t, lang, setLang } = useT(); const { logout, remove } = useAuth();
  const confirmDel = () => Alert.alert(t('del'), 'This permanently deletes your data.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: remove }]);
  return <Page><View style={{ padding: 20, gap: 12 }}>
    <Btn label={lang === 'en' ? 'मराठी' : 'English'} onPress={() => setLang(lang === 'en' ? 'mr' : 'en')} />
    <Btn label={t('logout')} onPress={logout} />
    <Btn kind="ghost" label={t('del')} onPress={confirmDel} />
    <Text onPress={() => Linking.openURL(CONFIG.PRIVACY_URL)} style={{ color: C.primary, textAlign: 'center', marginTop: 8 }}>Privacy Policy</Text>
  </View></Page>;
}
