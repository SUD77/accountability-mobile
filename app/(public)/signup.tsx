// app/(public)/signup.tsx
// Minimal signup with name + email + password. Returns token (per your backend choice).

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Link } from "expo-router";
import { Screen, Title, Subtitle, FieldLabel, FieldInput, PrimaryButton, ErrorText } from "../../src/ui/components";
import { useAuth } from "../../src/auth/AuthProvider";

const SignupSchema = z.object({
  display_name: z.string().min(2, "Min 2 chars").max(40),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type SignupForm = z.infer<typeof SignupSchema>;

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(SignupSchema) });

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup(data);
      router.replace("/(app)/groups");
    } catch (e: any) {
      alert(e?.message || "Signup failed");
    }
  };

  return (
    <Screen>
      <Title>Create account</Title>
      <Subtitle>Jump into a streak group with friends</Subtitle>

      <FieldLabel>Display name</FieldLabel>
      <FieldInput
        autoCapitalize="words"
        onChangeText={(t) => setValue("display_name", t)}
        {...register("display_name")}
        placeholder="Alice"
      />
      <ErrorText>{errors.display_name?.message}</ErrorText>

      <FieldLabel>Email</FieldLabel>
      <FieldInput
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(t) => setValue("email", t)}
        {...register("email")}
        placeholder="you@example.com"
      />
      <ErrorText>{errors.email?.message}</ErrorText>

      <FieldLabel>Password</FieldLabel>
      <FieldInput
        secureTextEntry
        onChangeText={(t) => setValue("password", t)}
        {...register("password")}
        placeholder="••••••••"
      />
      <ErrorText>{errors.password?.message}</ErrorText>

      <PrimaryButton loading={isSubmitting} onPress={handleSubmit(onSubmit)}>
        Sign up
      </PrimaryButton>

      <Subtitle>
        Have an account? <Link href="/(public)/login">Log in</Link>
      </Subtitle>
    </Screen>
  );
}
