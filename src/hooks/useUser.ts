"use client";
import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";
import type { AuthUser } from "@supabase/supabase-js";
import toast from "react-hot-toast";

export function useUser() {
    const [user, setUser] = useState<AuthUser>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        let isMounted = true;

        async function fetchUser() {
            setLoading(true);
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    throw error;
                }
                if (!data?.user) {
                    throw new Error('No user found');
                }
                if (isMounted) {
                    setUser(data.user);
                }
            } catch (err) {
                if (isMounted) {
                    toast.error(err as string);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchUser();
        return () => {
            isMounted = false;
        };
    }, []);

    return { user, loading };
} 