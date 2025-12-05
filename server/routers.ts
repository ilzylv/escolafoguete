import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const PYTHON_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://escolafoguete.onrender.com'
  : 'http://localhost:8000';

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Routers para cálculos de engenharia de foguetes
  calculosEngenharia: router({
    verificacaoEstrutural: publicProcedure
      .input(z.object({
        e: z.number().optional(),
        dext_c: z.number().optional(),
        pmax: z.number().optional(),
        te_c: z.number().optional(),
        te_b: z.number().optional(),
        d_p: z.number().optional(),
        df_p: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Usa a URL correta automaticamente
        const response = await fetch(`${PYTHON_API_URL}/api/verificacao-estrutural`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          // Log para ajudar a debugar se der erro
          console.error(`Erro na API Python (${PYTHON_API_URL}):`, response.statusText);
          throw new Error('Erro ao calcular verificação estrutural');
        }
        return await response.json();
      }),

    designTubeira: publicProcedure
      .input(z.object({
        F: z.number().optional(),
        p0: z.number().optional(),
        pe: z.number().optional(),
        T0: z.number().optional(),
        k: z.number().optional(),
        R: z.number().optional(),
        tipo: z.enum(['conica', 'parabolica']).optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await fetch(`${PYTHON_API_URL}/api/design-tubeira`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          console.error(`Erro na API Python (${PYTHON_API_URL}):`, response.statusText);
          throw new Error('Erro ao calcular design de tubeira');
        }
        return await response.json();
      }),

    performance: publicProcedure
      .input(z.object({
        target_apogee_m: z.number().optional(),
        burn_time_s: z.number().optional(),
        rocket_empty_mass_kg: z.number().optional(),
        propellant_mass_percent: z.number().optional(),
        rocket_diameter_cm: z.number().optional(),
        drag_coefficient: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await fetch(`${PYTHON_API_URL}/api/performance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          console.error(`Erro na API Python (${PYTHON_API_URL}):`, response.statusText);
          throw new Error('Erro ao calcular performance');
        }
        return await response.json();
      }),
  }),
});

export type AppRouter = typeof appRouter;