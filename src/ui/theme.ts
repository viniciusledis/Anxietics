import { Platform, StyleSheet, TextStyle } from 'react-native';

// Shared visual language. Game palettes and business values live in their own modules.
export const colors = {
  background: '#FBF9F2',
  paper: '#FFFFFF',
  ink: '#203D30',
  muted: '#617064',
  green: '#477D32',
  greenDark: '#2E5926',
  greenBright: '#A7CE71',
  lightGreen: '#EAF2DF',
  line: '#DFE5D8',
  yellow: '#F2C458',
  gold: '#8A5B0B',
  lightYellow: '#FFF2CF',
  orange: '#C77540',
  lightOrange: '#FAEBDD',
  blue: '#397C91',
  lightBlue: '#E7F3F5',
  error: '#A83F38',
  lightError: '#FCECE7',
  disabled: '#E4E8DE',
  disabledText: '#697263',
  overlay: 'rgba(27, 47, 34, 0.46)',
};
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, round: 999 };
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'system-ui',
});
export const type = {
  hero: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  title: {
    fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  section: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  body: { fontFamily, fontSize: 15, lineHeight: 22, fontWeight: '400' },
  label: { fontFamily, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  caption: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  small: { fontFamily, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  eyebrow: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
} satisfies Record<string, TextStyle>;
export const shadows = {
  soft: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
};
export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: space.xl,
    paddingBottom: space.xxxl,
    gap: space.xl,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: { ...type.hero, color: colors.ink },
  body: { ...type.body, color: colors.muted },
  eyebrow: { ...type.eyebrow, color: colors.green },
  caption: { ...type.caption, color: colors.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  section: { ...type.section, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.line },
});
