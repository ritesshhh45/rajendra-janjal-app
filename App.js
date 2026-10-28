import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth';
import { LangProvider, useT } from './src/i18n';
import { Login, Home, Schemes, Updates, Profile } from './src/screens';
import { C } from './src/config';

// Light theme + bg colour sarvikde fix = touch kelyavar black screen yet nahi
const theme = { ...DefaultTheme, dark: false, colors: { ...DefaultTheme.colors, background: C.bg, card: '#fff', primary: C.primary, text: C.text, border: '#F0D9C8' } };
const Tab = createBottomTabNavigator();
const icon = (n) => ({ color, size }) => <Ionicons name={n} size={size} color={color} />;

function Tabs() {
  const { t } = useT();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: C.primary, sceneStyle: { backgroundColor: C.bg } }}>
      <Tab.Screen name="Home" component={Home} options={{ title: t('home'), tabBarIcon: icon('home') }} />
      <Tab.Screen name="Schemes" component={Schemes} options={{ title: t('schemes'), tabBarIcon: icon('business') }} />
      <Tab.Screen name="Updates" component={Updates} options={{ title: t('updates'), tabBarIcon: icon('notifications') }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: t('profile'), tabBarIcon: icon('person') }} />
    </Tab.Navigator>
  );
}
function Gate() {
  const { session } = useAuth();
  if (session === undefined) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.primary} size="large" /></View>;
  return session ? <Tabs /> : <Login />;
}
export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: C.bg }}>
      <LangProvider><AuthProvider><NavigationContainer theme={theme}><StatusBar style="dark" /><Gate /></NavigationContainer></AuthProvider></LangProvider>
    </SafeAreaProvider>
  );
}
