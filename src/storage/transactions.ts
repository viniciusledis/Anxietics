import { initialProgress, Progress } from '../domain/progress';
import { ActionResult } from '../economy/rules';
import { createProgressRepository } from './repository';
export type TransactionResult = ActionResult & { storageError?: boolean };
type Repository = ReturnType<typeof createProgressRepository>;
type Operation = (current: Progress) => ActionResult;
// Uma fila para calcular, gravar e publicar. Nenhuma UI otimista para dinheiro/propriedade.
export function createTransactions(repository: Repository) {
  let current: Progress | null = null;
  let queue = Promise.resolve();
  let loading: Promise<void> | null = null;
  let pending = 0;
  let failed: { operation: Operation; key: string } | null = null;
  let error = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  const run = (operation: Operation, key = ''): Promise<TransactionResult> => {
    pending++;
    notify();
    const work = queue.then(async () => {
      const previous = current ?? initialProgress();
      try {
        if (!current && key !== 'reset')
          throw new Error('Progresso ainda não carregado.');
        const result = operation(previous);
        if (result.progress !== current) {
          await repository.save(result.progress);
          current = result.progress;
        }
        if (result.ok && (failed?.key === key || key === 'reset')) {
          failed = null;
          error = false;
        }
        return result;
      } catch {
        failed = { operation, key };
        error = true;
        return {
          progress: previous,
          ok: false,
          storageError: true,
          message:
            'Não foi possível salvar. A alteração não foi confirmada. Tente novamente antes de sair.',
        };
      } finally {
        pending--;
        notify();
      }
    });
    queue = work.then(() => undefined);
    return work;
  };
  return {
    getSnapshot: () => ({ progress: current, busy: pending > 0, error }),
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load(): Promise<void> {
      if (current) return Promise.resolve();
      if (loading) return loading;
      // Chamadas simultâneas compartilham a ativação; não regravam uma migração antiga.
      loading = (async () => {
        const loaded = await repository.load();
        await repository.save(loaded);
        current = loaded;
        error = false;
        failed = null;
        notify();
      })().finally(() => {
        loading = null;
      });
      return loading;
    },
    run,
    retry: () =>
      failed ? run(failed.operation, failed.key) : Promise.resolve(null),
    reset: () =>
      run(
        () => ({
          progress: initialProgress(),
          ok: true,
          message: 'Perfil local reiniciado.',
        }),
        'reset',
      ),
  };
}
