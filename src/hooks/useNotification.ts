import { useSnackbar, VariantType } from 'notistack';
import { useCallback } from 'react';

const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const sendNotification = useCallback(
    (text: string, variant: VariantType) => {
      enqueueSnackbar(text, {
        variant: variant || 'success',
        preventDuplicate: true,
        style: { whiteSpace: 'pre-line' },
      });
    },
    [enqueueSnackbar]
  );

  return sendNotification;
};

export default useNotification;
