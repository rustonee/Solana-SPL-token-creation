import '@/styles/globals.css';
import '@/styles/colors.css';

import Base from '@/components/common/base';
import WithLoading from '@/components/common/withLoading';

require('@solana/wallet-adapter-react-ui/styles.css');

export default WithLoading(Base);
