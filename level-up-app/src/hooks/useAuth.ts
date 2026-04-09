import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

// 로그인 상태를 관리하는 훅
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 로그인된 유저 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 로그인/로그아웃 이벤트 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 회원가입
  // 이미 가입했지만 인증 안 된 경우 인증 메일을 재발송
  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Supabase는 이미 존재하는 미인증 유저에 대해 빈 session을 반환
    // 이 경우 인증 메일 재발송
    if (data.user && !data.session) {
      await supabase.auth.resend({ type: "signup", email });
    }
  }

  // 로그인
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }

  // 로그아웃
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return { user, loading, signUp, signIn, signOut };
}
