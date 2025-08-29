interface RequestBody {
  data?: (string | number)[];
}

interface Environment {
  FULL_NAME?: string;
  DOB?: string;
  EMAIL?: string;
  ROLL_NUMBER?: string;
}

interface ApiResponse {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  odd_numbers: string[];
  even_numbers: string[];
  alphabets: string[];
  special_characters: string[];
  sum: string;
  concat_string: string;
}

interface ErrorResponse {
  is_success: boolean;
  error: string;
}

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    if (request.method === "POST" && new URL(request.url).pathname === "/bfhl") {
      try {
        const body: RequestBody = await request.json();
        const data: (string | number)[] = body.data || [];

        const FULL_NAME: string = env.FULL_NAME || "";
        const DOB: string = env.DOB || "";
        const EMAIL: string = env.EMAIL || "";
        const ROLL_NUMBER: string = env.ROLL_NUMBER || "";

        // ensure lowercase and underscores
        const normalizedName: string = FULL_NAME.trim().toLowerCase().replace(/\s+/g, "_");

        let even_numbers: string[] = [];
        let odd_numbers: string[] = [];
        let alphabets: string[] = [];
        let special_characters: string[] = [];
        let sum: number = 0;

        for (const item of data) {
          if (!isNaN(item as number)) {
            let num: number = parseInt(item as string, 10);
            if (!isNaN(num)) {
              if (num % 2 === 0) even_numbers.push(item as string);
              else odd_numbers.push(item as string);
              sum += num;
            }
          } else if (/^[a-zA-Z]+$/.test(item as string)) {
            alphabets.push((item as string).toUpperCase());
          } else {
            special_characters.push(item as string);
          }
        }

        // Alternating caps reversed concat
        const concat_string: string = (() => {
          const reversed: string = alphabets.join("").split("").reverse().join("");
          return reversed
            .split("")
            .map((ch: string, i: number) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
            .join("");
        })();

        const response: ApiResponse = {
          is_success: true,
          user_id: `${normalizedName}_${DOB}`,
          email: EMAIL,
          roll_number: ROLL_NUMBER,
          odd_numbers,
          even_numbers,
          alphabets,
          special_characters,
          sum: sum.toString(),
          concat_string,
        };

        return new Response(JSON.stringify(response, null, 2), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      } catch (err) {
        const errorResponse: ErrorResponse = {
          is_success: false,
          error: err instanceof Error ? err.message : String(err)
        };
        return new Response(
          JSON.stringify(errorResponse),
          { headers: { "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
