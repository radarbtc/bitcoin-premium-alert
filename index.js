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

document.addEventListener("DOMContentLoaded", (e) => {
  const newtab = document.getElementById("newtab");
  const btcBRL = document.getElementById("brl-price");
  const btcUSD = document.getElementById("usd-price");
  const premium = document.getElementById("premium");

  newtab.addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({url: "https://radarbtc.com.br", active: true});
  }, false);

  chrome.storage.sync.get(['brlPrice'], (res) => {
    btcBRL.innerText = "R$ " + res.brlPrice;
  });

  chrome.storage.sync.get(['usdPrice'], (res) => {
    btcUSD.innerText = "US$ " + res.usdPrice;
  });

  chrome.storage.sync.get(['premiumRate'], (res) => {
    premium.innerText = res.premiumRate + "%";
  });

}, true);
