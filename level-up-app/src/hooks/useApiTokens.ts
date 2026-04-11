import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabase";

export interface ApiToken {
  id: number;
  name: string;
  token: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export function useApiTokens(userId: string) {
  const [tokens, setTokens] = useState<ApiToken[]>([]);

  const fetchTokens = useCallback(async () => {
    const { data } = await supabase
      .from("api_tokens")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setTokens(
        data.map((t) => ({
          id: t.id,
          name: t.name,
          token: t.token,
          createdAt: t.created_at,
          lastUsedAt: t.last_used_at,
        }))
      );
    }
  }, [userId]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // 토큰 생성
  async function createToken(name: string): Promise<string> {
    // 랜덤 토큰 생성
    const token =
      "lu_" +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const { error } = await supabase.from("api_tokens").insert({
      user_id: userId,
      name,
      token,
    });

    if (error) throw error;
    await fetchTokens();
    return token;
  }

  // 토큰 삭제
  async function deleteToken(id: number) {
    await supabase.from("api_tokens").delete().eq("id", id);
    await fetchTokens();
  }

  return { tokens, createToken, deleteToken };
}
