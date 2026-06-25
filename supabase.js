/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "https://gbecjtxfdpzwhjeououn.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_23Gk6zKm0z3QP8BcLW3q3A_Td2mIiUT";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );