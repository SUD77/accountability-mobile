// src/ui/datePicker.tsx
// A simple, native date input for React Native (Android/iOS) using
// @react-native-community/datetimepicker. Displays as dd-mm-yyyy.
// Value is passed around as YYYY-MM-DD for the API.

import React from "react";
import { Platform, Pressable, Text, View, Modal } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { dateFromYMD, formatDDMMYYYY, ymdFromDate } from "../utils/dates";

export function DateField({
  label,
  valueYMD,
  onChangeYMD,
  minimumYMD,
  maximumYMD,
}: {
  label: string;
  valueYMD: string;
  onChangeYMD: (nextYMD: string) => void;
  minimumYMD?: string;
  maximumYMD?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const fallback = new Date();
  const current = dateFromYMD(valueYMD) ?? fallback;
  const minDate = minimumYMD ? dateFromYMD(minimumYMD) ?? undefined : undefined;
  const maxDate = maximumYMD ? dateFromYMD(maximumYMD) ?? undefined : undefined;

  const handleChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setOpen(false);
    if (selected) onChangeYMD(ymdFromDate(selected));
  };

  const body = (
    <DateTimePicker
      value={current}
      mode="date"
      display={Platform.select({ ios: "spinner", android: "calendar" })}
      onChange={handleChange}
      minimumDate={minDate}
      maximumDate={maxDate}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 4 }}>{label}</Text>

      {/* Button that shows the current date in dd-mm-yyyy */}
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ fontSize: 16 }}>{formatDDMMYYYY(valueYMD)}</Text>
      </Pressable>

      {/* iOS: show in a modal; Android: show native inline dialog */}
      {Platform.OS === "ios" ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable
            onPress={() => setOpen(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          >
            <Pressable
              onPress={() => {}}
              style={{ backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            >
              {body}
              <View style={{ height: 8 }} />
              <Pressable
                onPress={() => setOpen(false)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#374151" : "#111827",
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                })}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : open ? (
        // Android shows a native dialog; render the picker inline as well for consistency / instant change.
        body
      ) : null}
    </View>
  );
}
