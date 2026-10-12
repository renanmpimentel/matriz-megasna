// A worker identity is also a request token: cancelled runs cannot update the UI.
export function createGeneratorRunner({ createWorker, onStart, onResult, onError, onCancel }) {
  let current = null;

  function terminate() {
    current?.terminate();
    current = null;
  }

  return {
    start(payload) {
      terminate();
      onStart();
      try {
        const worker = createWorker();
        current = worker;
        worker.onmessage = ({ data }) => {
          if (current !== worker) return;
          terminate();
          if (data?.type === "result") onResult(data.result);
          else onError();
        };
        worker.onerror = event => {
          event.preventDefault?.();
          if (current !== worker) return;
          terminate();
          onError();
        };
        worker.onmessageerror = worker.onerror;
        worker.postMessage(payload);
      } catch {
        terminate();
        onError();
      }
    },
    cancel() {
      if (!current) return;
      terminate();
      onCancel();
    }
  };
}
