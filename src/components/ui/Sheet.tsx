import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { breakpoints } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface SheetProps {
  visible: boolean;
  onClose?(): void;
  title?: string;
  children: ReactNode;
}

export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdropWrapper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderTopLeftRadius: theme.radii.lg,
              borderTopRightRadius: theme.radii.lg,
              gap: theme.spacing.md,
              padding: theme.spacing.lg,
              paddingTop: theme.spacing.sm,
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: theme.colors.border },
            ]}
          />
          {title ? (
            <Text
              accessibilityRole="header"
              style={[theme.typography.heading, { color: theme.colors.text }]}
            >
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 10, 31, 0.55)',
  },
  sheet: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    maxHeight: '85%',
    maxWidth: breakpoints.contentWidth,
    paddingBottom: 32,
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    borderRadius: 999,
    height: 4,
    width: 40,
  },
});
