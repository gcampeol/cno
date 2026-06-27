-- FASE DE TESTE: remove a trava que proíbe nome de Pessoa Física, para
-- validar os dados reais com o nome do responsável visível.
--
-- ANTES DE LANÇAR: recolocar a trava e zerar os nomes de PF (LGPD). Ver o
-- bloco "Reverter para produção" no fim deste arquivo.

alter table public.obras drop constraint if exists pf_sem_nome;

-- ----------------------------------------------------------------------------
-- Reverter para produção (rodar quando for lançar):
--
-- update public.obras set responsavel_nome = null where responsavel_tipo = 'PF';
-- alter table public.obras
--   add constraint pf_sem_nome
--   check (responsavel_tipo <> 'PF' or responsavel_nome is null);
-- ----------------------------------------------------------------------------
