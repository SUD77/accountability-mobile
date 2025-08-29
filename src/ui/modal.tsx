// src/ui/modal.tsx
// Simple modal wrapper with a dim backdrop.

import React from "react";
import { Modal, View, Pressable } from "react-native";

export function SimpleModal({
  visible,
  onRequestClose,
  children,
}: {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <Pressable
        onPress={onRequestClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: 20,
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            gap: 10,
          }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
