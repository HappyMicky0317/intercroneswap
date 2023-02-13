import { MintContractData } from '../pages/Mint/types';
import apiICR from '../assets/images/apiICR2.png';
import ApiTron from '../assets/images/ApiTron.png';

export const mintData: MintContractData[] = [
  {
    address: '0xA44F3F89F70648B1467172BA3C0B0102BE95A62D',
    earnToken: 'TRX',
    logo: ApiTron,
  },
  {
    address: '0x374BA0F70FB50639EB1FD545C31DC80F6914717A',
    earnToken: 'ICR',
    logo: apiICR,
  },
];
