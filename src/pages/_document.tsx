import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link
          rel='preload'
          href='/fonts/CalSans-SemiBold.ttf'
          as='font'
          type='font/ttf'
          crossOrigin='anonymous'
        />
        <link
          rel='preload'
          href='/fonts/ClashDisplay-Regular.ttf'
          as='font'
          type='font/ttf'
          crossOrigin='anonymous'
        />
      </Head>
      <body className='no-scrollbar text-text-400 bg-bg-100'>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
