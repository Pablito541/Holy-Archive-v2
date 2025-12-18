import { createClient } from "@/lib/supabase-server";

export default async function TestPage() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('organizations').select('name').limit(1);

        if (error) {
            return (
                <div className="p-10">
                    <h1 className="text-red-500 font-bold">Supabase Error</h1>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            );
        }

        return (
            <div className="p-10">
                <h1 className="text-green-500 font-bold">Supabase Success!</h1>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    } catch (e: any) {
        return (
            <div className="p-10">
                <h1 className="text-red-500 font-bold">Exception</h1>
                <pre>{e.message}</pre>
                <pre>{e.stack}</pre>
            </div>
        );
    }
}
