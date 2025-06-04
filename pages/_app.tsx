import React from 'react';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Объявляем глобальный тип для ym
declare global {
  interface Window {
    ym: (id: number, method: string, ...args: any[]) => void;
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const metrikaId = 102305120;

  // Отслеживание переходов между страницами
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && window.ym) {
        window.ym(metrikaId, 'hit', url);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Component {...pageProps} />
      
      {/* Яндекс.Метрика - загружается только в production */}
      {process.env.NODE_ENV === 'production' && (
        <>
          <Script
            id="yandex-metrika"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                ym(${metrikaId}, "init", {
                  clickmap:true,
                  trackLinks:true,
                  accurateTrackBounce:true
                });
              `
            }}
          />
          
          <noscript>
            <div>
              <img 
                src={`https://mc.yandex.ru/watch/${metrikaId}`} 
                style={{ position: 'absolute', left: '-9999px' }} 
                alt=""
              />
            </div>
          </noscript>
        </>
      )}
    </>
  );
}

export default MyApp; 