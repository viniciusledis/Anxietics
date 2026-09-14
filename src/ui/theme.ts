import { StyleSheet } from 'react-native';

export const colors = {
  background: '#F5F4EB',
  paper: '#FFFEF8',
  ink: '#243E34',
  muted: '#667166',
  green: '#365E48',
  lightGreen: '#E2E8D5',
  line: '#DDE1D3',
  yellow: '#E7C66A',
};

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -1,
  },
  body: { fontSize: 16, lineHeight: 23, color: colors.muted },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.green,
  },
});
