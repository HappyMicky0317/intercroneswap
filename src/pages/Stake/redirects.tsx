import { Redirect, RouteComponentProps } from 'react-router-dom';
import tronweb from 'tronweb';
import Stake from '.';
import { useActiveWeb3React } from '../../hooks';

export function RedirectToStake() {
  return <Redirect to="/stake/" />;
}

export function RedirectToReferal(props: RouteComponentProps<{ referal?: string }>) {
  const { account } = useActiveWeb3React();
  const {
    match: {
      params: { referal },
    },
  } = props;
  if (!account || !tronweb?.isAddress(referal)) {
    return RedirectToStake();
  }
  return <Stake {...props} />;
}
