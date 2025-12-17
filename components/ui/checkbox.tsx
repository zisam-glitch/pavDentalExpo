import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ThemedText } from '../themed-text';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  link?: string;
  style?: ViewStyle;
}

export function Checkbox({ value, onValueChange, label, style, link }: CheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      // Scale up animation when checked
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Scale down animation when unchecked
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [value]);

  return (
    <Pressable 
      style={[styles.container, style]} 
      onPress={() => onValueChange(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
    >
      <View style={[styles.checkbox, value && styles.checked]}>
        <Animated.View 
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }
          ]}
        >
          <View style={styles.checkmark} />
        </Animated.View>
      </View>
      {label && <ThemedText style={styles.label}>{label}
        {link}
        </ThemedText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: "center"
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#925927',
    marginRight: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checked: {
    backgroundColor: '#925927',
  },
  checkmarkContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'white',
    transform: [{ rotate: '-45deg' }],
    marginBottom: 2,
  },
  label: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'YouSans-Regular'
  },
});
