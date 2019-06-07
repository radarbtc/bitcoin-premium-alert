const queryBrlUsdRate = async () => {
  const brlPrice = await fetch(
    'https://api.coinbase.com/v2/exchange-rates',
    { mode: 'cors' }
  )
  .then(res => res.json());

  return brlPrice.data.rates.BRL
}

const queryBrlPrice = async () => {
  const btdPrice = await fetch(
    'https://api.bitcointrade.com.br/v2/public/BRLBTC/ticker',
  )
  .then(res => res.json());

  const mbtPrice = await fetch(
    'https://www.mercadobitcoin.net/api/BTC/ticker/',
    { mode: 'cors' }
  )
  .then(res => res.json());

  const brlPrice = (
    await parseFloat(btdPrice.data.last) + await parseFloat(mbtPrice.ticker.last)
  ) / 2;

  return brlPrice;
};

const queryUsdPrice = async () => {
  const cbsPrice = await fetch(
    'https://api.coinbase.com/v2/prices/BTC-USD/spot',
    { mode: 'cors' }
  ).then(res => res.json());

  const krkPrice = await fetch(
    'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
    { mode: 'cors' }
  )
  .then(res => res.json());

  const usdPrice = (
      await parseFloat(cbsPrice.data.amount) + await parseFloat(krkPrice.result.XXBTZUSD.c[0])
    ) / 2;

  return usdPrice;
};

const premiumRate = async () => {
  const brlPrice = await queryBrlPrice();
  const usdPrice = await queryUsdPrice();
  const usdBrl = await queryBrlUsdRate();

  const premium = 1 - (brlPrice / usdBrl) / usdPrice;

  return premium * 100;
}

const setBadge = (e) => {
  chrome.storage.sync.get(['premiumRate'], (res) => {
    const color = (res.premiumRate >= 4.0) ? "#e84118" : (2.5 <= res.premiumRate) ? "#fbc531" : "#44bd32";
    const text = (res.premiumRate >= 4.0) ? "Wait" : (2.5 <= res.premiumRate) ? "Warn" : "Buy";

    chrome.browserAction.setBadgeBackgroundColor({color})
    chrome.browserAction.setBadgeText({text})
  });
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.sync.set({brlRate: 0});
  chrome.storage.sync.set({usdPrice: 0});
  chrome.storage.sync.set({brlPrice: 0});
  chrome.storage.sync.set({premiumRate: 0});

  await queryBrlUsdRate()
    .then(e => {
      chrome.storage.sync.set({brlRate: e});
    }).catch(err => {
      chrome.storage.sync.set({brlRate: "err"});
      console.log(err);
    });

  await queryBrlPrice()
    .then(e => {
      chrome.storage.sync.set({brlPrice: parseFloat(e).toFixed(0)});
    }).catch(err => {
      chrome.storage.sync.set({brlPrice: "err"});
      console.log(err);
    });

  await queryUsdPrice()
    .then(e => {
      chrome.storage.sync.set({usdPrice: parseFloat(e).toFixed(0)});
    }).catch(err => {
      chrome.storage.sync.set({usdPrice: "err"});
      console.log(err);
    });

  await premiumRate()
    .then(e => {
      chrome.storage.sync.set({premiumRate: ((~(e * 100) + 1) / 100)});
    }).catch(err => {
      chrome.storage.sync.set({premiumRate: "err"});
      console.log(err);
    });

  setBadge();
});

setInterval(async () => {

  await queryBrlUsdRate()
    .then(e => {
      chrome.storage.sync.set({brlRate: e});
    }).catch(err => {
      chrome.storage.sync.set({brlRate: "err"});
      console.log(err);
    });

  await queryBrlPrice()
    .then(e => {
      chrome.storage.sync.set({brlPrice: e.toFixed(0)});
    }).catch(err => {
      chrome.storage.sync.set({brlPrice: "err"});
      console.log(err);
    });

  await queryUsdPrice()
    .then(e => {
      chrome.storage.sync.set({usdPrice: e.toFixed(0)});
    }).catch(err => {
      chrome.storage.sync.set({usdPrice: "err"});
      console.log(err);
    });

  await premiumRate()
    .then(e => {
      chrome.storage.sync.set({premiumRate: ((~(e * 100) + 1) / 100)});
    }).catch(err => {
      chrome.storage.sync.set({premiumRate: "err"});
      console.log(err);
    });

  setBadge();
}, (30 * 1000));
