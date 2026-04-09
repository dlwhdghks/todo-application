import { createClient } from "@supabase/supabase-js";

// Supabase 접속 정보
const SUPABASE_URL = "https://qzzmgfdebvolenkfjxyz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FTb6P-owNr2QnZo8HmeEHw_NZA2VLzY";

// Supabase 클라이언트 생성 (앱 전체에서 이 하나를 공유)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
