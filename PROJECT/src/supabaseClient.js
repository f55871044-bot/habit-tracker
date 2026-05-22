import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qsirssncgzmleavkckqe.supabase.co";
const supabaseKey = "sb_publishable_36HB76jptY6AMz-FkkqUmA_QuDydCSF";

export const supabase = createClient(supabaseUrl, supabaseKey);