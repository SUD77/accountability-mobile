// app/(public)/login.tsx
// Simple, clean login screen with react-hook-form + zod validation.

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Link } from "expo-router";
import { Screen, Title, Subtitle, FieldLabel, FieldInput, PrimaryButton, ErrorText } from "../../src/ui/components";
import { useAuth } from "../../src/auth/AuthProvider";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      router.replace("/(app)/groups");
    } catch (e: any) {
      alert(e?.message || "Login failed");
    }
  };

  return (
    <Screen>
      <Title>Welcome back</Title>
      <Subtitle>Log in to continue your streaks</Subtitle>

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
        Log in
      </PrimaryButton>

      <Subtitle>
        New here? <Link href="/(public)/signup">Create an account</Link>
      </Subtitle>
    </Screen>
  );
}
