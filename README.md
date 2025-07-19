<div align="center">
  <img src="static/favicon.png" alt="Calm Coffee Logo" width="120" />

  # Calm Coffee ☕
</div>

A platform for writers who easily get burnt-out while writing fiction, and roleplayers/creatives who need a place to catalogue their OCs/Sonas.

---

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) (frontend framework)
- [Supabase](https://supabase.com/) (database & auth)
- Custom Markdown system for rich text and story blocks

---

## Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/maxisjoe/calm-coffee.git
   cd calm-coffee
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment:**
   - Copy `.env.example` to `.env` and fill in your Supabase credentials (if running locally)
4. **Run the dev server:**
   ```bash
   npm run dev
   ```
5. **Open in your browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

---

## Contributing

We welcome contributions! To get started:

- Fork this repository and create a new branch for your feature or bugfix.
- Follow the [Community Rules](https://github.com/maxisjoe/calm-coffee/blob/main/static/text/rules.md) and code of conduct.
- Submit a pull request with a clear description of your changes.

---

## License

This project is licensed under the [GNU General Public License v3.0 (GPL-3.0)](LICENSE).

---

## Links

- [Live Site](https://calm-coffee.vercel.app/)
- [GitHub](https://github.com/MaxIsJoe/CalmCoffee)
- [Community Rules](static/text/rules.md)

---

## FAQ

### Why did I create Calm Coffee?

Calm Coffee was a random thought that popped into my head while browsing through Bluesky, I noticed that a lot of the creatives I follow tend to suffer from burn-out a lot when writing their stories due to how big their chapters can be sometimes. I asked myself, "why can't they just do things in small manageable chunks?" and a lightbulb lit up in my head.

Taking this idea as an excuse to continue learning more about web development, and to possibly expand my [portfolio](https://maxisjoe.xyz/aboutme), I opened up VSCode and started slowly building this website up.


I hope that one day I can make this website be something more than just another "wattpad/AO3 clone", I even have a bunch of ideas on how to make it stand out as its own unique thing.


### Will Calm Coffee ever be monetized?

Probably not.

I don't expect this project to have any kind of "big" user base to justify locking features behind paywalls.

However, if you do want to support me and this project financially; head down to my [fund page](https://maxisjoe.xyz/maxfund) to contribute.



### I have an idea / request, can I get it implemented?


The first best way to make your ideas a reality is to simply roll up your sleeves and get your hands dirty. Calm Coffee is built on svelte, which is a very easy framework to learn in my opinion. So, as we say on [UnityStation](https://unitystation.org), "When you code it yourself". Fork the project and open a PR with what you want added/changed.


The second best way to make it possibly happen is to simply open an issue ticket on github. Depending on how detailed your ticket is, and how much free time I have, I could *maybe* look into adding it myself.


The third best way to make it happen is to pay me to do it. Will work 95% of the time, sometimes with same day shipping, lol.


### Why Svelte?


I like svelte.

It's easy, and doesn't look messy.

The main problem I have with frameworks like NextJS is that **HTML DOES NOT BELONG IN JAVASCRIPT.**

WEBSITES WERE NOT MEANT TO BE ENTIRELY BUILT WITHIN FUNCTIONS.

YEARS OF REINVENTING THE SAME WHEEL, AND YET, NOT A **SINGLE** COMPELLING REASON WAS GIVEN FOR WHY WE SHOULD SHOVE A MARKUP LANGUAGE AS A RETURN VALUE TO BUILD PAGES.

***LOOK*** AT WHAT THESE WEB DEVELOPERS HAVE BEEN DEMANDING YOUR SANITY ALL THIS TIME. (THESE ARE REAL WEBPAGES, MADE BY REAL DEVELOPERS)

???

```js
// pages/index.tsx
export default function Home() {
  if (typeof window !== 'undefined') {
    document.body.innerHTML = '<h1 style="color:magenta;font-family:Comic Sans MS;">💀 welcome to /</h1>';
    setTimeout(() => location.reload(), 1000);
  }
  return null;
}
```

??????

```js

export default function Home() {
  useEffect(() => {
    eval("document.body.innerHTML='<marquee>Next.js is crying</marquee>'; alert('rendered!')")
    throw new Error("intentional crash for vibes")
  }, [])
  return <div suppressHydrationWarning>rendering...</div>
}

```

???????????


```js

export default function Cursed() {
  let content = "not loaded";
  fetch('/robots.txt')
    .then(res => res.text())
    .then(txt => document.body.innerHTML = `<pre>${txt}</pre>`)
    .catch(() => document.body.innerHTML = `<h1>💀 failed to fetch</h1>`);
  return <h1>fetching locally... probably</h1>;
}

```


THEY HAVE PLAYED US FOR ABSOLUTE **FOOLS**.
