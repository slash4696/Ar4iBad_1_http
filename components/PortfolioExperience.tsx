"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import BrandLink from "@/components/BrandLink";
import { site } from "@/lib/site";

type GalleryItem = { src: string; title: string; note: string; width: number; height: number };

const gallery: GalleryItem[] = [
  {
    src: "/images/neuro-camera.jpg",
    title: "Между кадрами",
    note: "Портрет · цифровая съёмка",
    width: 896,
    height: 1600,
  },
  {
    src: "/images/neuro-red.jpg",
    title: "Красный — это характер",
    note: "Fashion · цветовой акцент",
    width: 1088,
    height: 1472,
  },
  {
    src: "/images/neuro-daisy.jpg",
    title: "Тихое лето",
    note: "Портрет · естественный свет",
    width: 1088,
    height: 1472,
  },
  {
    src: "/images/neuro-city.jpg",
    title: "Город остаётся фоном",
    note: "Street · вечерний свет",
    width: 896,
    height: 1600,
  },
  {
    src: "/images/neuro-close.jpg",
    title: "Ближе к себе",
    note: "Beauty · портрет",
    width: 896,
    height: 1600,
  },
];

export default function PortfolioExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sessionSlide, setSessionSlide] = useState(0);
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [telegramConsent, setTelegramConsent] = useState(false);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") setLightbox((current) => current === null ? 0 : (current + 1) % gallery.length);
      if (event.key === "ArrowLeft") setLightbox((current) => current === null ? gallery.length - 1 : (current - 1 + gallery.length) % gallery.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    setFormMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.telegramConsent = telegramConsent ? "on" : "";
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error || "Не удалось сохранить заявку.");
      }
      const result = await response.json().catch(() => null) as { telegram?: string } | null;
      form.reset();
      setTelegramConsent(false);
      setFormState("sent");
      setFormMessage(result?.telegram === "sent"
        ? "Заявка сохранена, уведомление отправлено автору в Telegram. Спасибо!"
        : result?.telegram === "not_configured" || result?.telegram === "failed"
          ? "Заявка сохранена в базе, но уведомление в Telegram пока не настроено."
          : "Заявка сохранена. Спасибо — скоро свяжусь с тобой.");
    } catch (error) {
      setFormState("error");
      setFormMessage(error instanceof Error ? error.message : "Не удалось сохранить заявку.");
    }
  }

  const closeMenu = () => setMenuOpen(false);
  const activeImage = lightbox === null ? null : gallery[lightbox];
  const sessionImage = gallery[sessionSlide];

  return (
    <main>
      <header className="site-header">
        <BrandLink href="#top" />
        <button className="menu-toggle" aria-expanded={menuOpen} aria-label="Открыть меню" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Главная навигация">
          <a href="#about" onClick={closeMenu}>Автор</a>
          <a href="#work" onClick={closeMenu}>Работы</a>
          <a href="#session" onClick={closeMenu}>Нейрофотосессии</a>
          <Link href="/auth" onClick={closeMenu}>Личный кабинет</Link>
        </nav>
        <a className="header-cta" href="#order">Обсудить проект <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <Image
          className="hero-image"
          src="/images/cover-hero-ismagic.jpg"
          alt="Артур в студии фотографии и цифровой обработки"
          fill
          priority
          sizes="100vw"
          unoptimized
        />
        <div className="hero-blur-layer" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-grain" />
        <div className="hero-copy">
          <p className="hero-kicker"><span className="signal-dot" /> {site.city} · фотография · нейросети · обработка</p>
          <h1 id="hero-title">Пора на<br />обложку?<br /><em>Погнали!</em></h1>
          <div className="hero-bottom">
            <p>Визуальные истории, в которых есть характер.<br />От первого кадра до последнего оттенка.</p>
            <a className="circle-link" href="#work" aria-label="Перейти к работам"><span>↓</span></a>
          </div>
        </div>
        <span className="hero-side-note">Авторское портфолио / 2026</span>
      </section>

      <section className="intro section-shell" id="about">
        <div className="section-index reveal"><span>01</span><span className="index-rule" /> Об авторе</div>
        <div className="intro-grid">
          <h2 className="intro-title reveal">Технологии<br />создают образ.<br /><span>Чувство — кадр.</span></h2>
          <div className="intro-copy reveal">
            <p className="large-copy">Я соединяю фотографию, нейросети и аккуратную ручную обработку, чтобы получить не случайную картинку, а точное настроение.</p>
            <p>Я — {site.author}, фотограф и автор ISMAGIC Ar4i Frame из Ноябрьска. Работаю с Photoshop и Lightroom: сохраняю естественность, собираю свет и цвет, добавляю детали там, где они рассказывают историю. Без одинаковых фильтров — каждый образ начинается с человека.</p>
            <div className="craft-list" aria-label="Инструменты">
              <span>Фотография</span><span>AI-генерация</span><span>Photoshop</span><span>Lightroom</span>
            </div>
          </div>
        </div>
        <div className="portrait-strip reveal">
          <Image src="/images/about-feeling-ismagic.jpg" alt="Фотограф за работой с коллекцией портретных снимков" fill sizes="(max-width: 700px) 100vw, 46vw" unoptimized />
          <span className="portrait-caption">За каждым изображением<br />стоит человеческий взгляд.</span>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-shell">
          <div className="section-index section-index--light reveal"><span>02</span><span className="index-rule" /> Выбранные работы</div>
          <div className="work-heading reveal">
            <h2>Разные образы.<br /><span>Один человек.</span></h2>
            <p>Нажмите на работу, чтобы рассмотреть её ближе. Понравившийся пример можно скачать.</p>
          </div>
          <div className="gallery-grid">
            {gallery.map((item, index) => (
              <article className="gallery-card reveal" key={item.src}>
                <button className="gallery-open" type="button" onClick={() => setLightbox(index)} aria-label={`Посмотреть: ${item.title}`}>
                  <Image src={item.src} alt={item.title} width={item.width} height={item.height} sizes="(max-width: 700px) 50vw, (max-width: 1020px) 33vw, 20vw" unoptimized />
                  <span className="gallery-zoom" aria-hidden="true">↗</span>
                  <span className="gallery-caption"><strong>{item.title}</strong><small>{item.note}</small></span>
                </button>
                <a className="download-sample" href={item.src} download aria-label={`Скачать пример «${item.title}»`}>Скачать пример <span aria-hidden="true">↓</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="session-section section-shell" id="session">
        <div className="section-index reveal"><span>03</span><span className="index-rule" /> Нейрофотосессия</div>
        <div className="session-grid">
          <div className="session-copy reveal">
            <p className="session-label"><span className="signal-dot" /> Первый продукт</p>
            <h2>Новый образ.<br /><em>Твоё лицо.</em></h2>
            <p className="session-description">Нейрофотосессия по твоим фотографиям: 10 готовых кадров в выбранных локациях и ракурсах с постобработкой. Согласуем настроение и образы до начала работы.</p>
            <ul className="session-details">
              <li><span>01</span> Пришли исходные фотографии и пожелания</li>
              <li><span>02</span> Выбери локации и ракурсы</li>
              <li><span>03</span> Получи 10 обработанных фото</li>
            </ul>
            <a className="button button--lime" href="#order">Заказать за 490 ₽ <span aria-hidden="true">↗</span></a>
            <p className="fine-print">Пока оплата не подключена — это заявка, никаких списаний.</p>
          </div>
          <div className="session-photo reveal">
            <Image src={sessionImage.src} alt={`Пример нейрофотосессии: ${sessionImage.title.toLowerCase()}`} fill sizes="(max-width: 800px) 100vw, 44vw" unoptimized style={{ objectFit: "contain" }} />
            <span className="photo-stamp">ПРИМЕР<br /><b>{String(sessionSlide + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</b></span>
            <p className="photo-caption">Образ начинается<br />с твоего взгляда.</p>
            <div className="session-slider-controls" aria-label="Примеры нейрофотосессии">
              <button type="button" onClick={() => setSessionSlide((sessionSlide - 1 + gallery.length) % gallery.length)} aria-label="Предыдущий пример">←</button>
              <div className="session-slider-dots">
                {gallery.map((item, index) => <button key={item.src} type="button" className={index === sessionSlide ? "is-active" : ""} onClick={() => setSessionSlide(index)} aria-label={`Пример ${index + 1} из ${gallery.length}`} aria-current={index === sessionSlide ? "true" : undefined} />)}
              </div>
              <button type="button" onClick={() => setSessionSlide((sessionSlide + 1) % gallery.length)} aria-label="Следующий пример">→</button>
            </div>
          </div>
        </div>
        <div className="marquee" aria-hidden="true"><div className="marquee-track">ОБРАЗ · СВЕТ · ХАРАКТЕР · ОБРАЗ · СВЕТ · ХАРАКТЕР ·&nbsp;</div></div>
      </section>

      <section className="order-section" id="order">
        <div className="section-shell order-layout">
          <div className="order-copy reveal">
            <div className="section-index section-index--light"><span>04</span><span className="index-rule" /> Начнём с идеи</div>
            <h2>Расскажи,<br />какой образ<br /><em>хочешь увидеть.</em></h2>
            <p>Оставь контакт и пожелания. Я отвечу и помогу согласовать 10 фото в выбранных локациях и ракурсах.</p>
            <div className="order-price"><strong>490 ₽</strong><span>нейрофотосессия</span></div>
          </div>
          <form className="lead-form reveal" onSubmit={submitRequest}>
            <label>Как к тебе обращаться<input name="name" autoComplete="name" maxLength={120} required placeholder="Имя" /></label>
            <label>Куда ответить<input name="contact" autoComplete="tel" maxLength={180} required placeholder="Телефон или @ник в мессенджере" /></label>
            <label>Какой образ хочется создать?<textarea name="message" maxLength={1200} rows={3} placeholder="Можно в двух словах — обсудим детали позже" /></label>
            <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            <label className="consent"><input type="checkbox" name="consent" required /><span>Согласен на обработку данных для ответа на заявку. <Link href="/privacy" target="_blank">Подробнее</Link></span></label>
            <label className="consent"><input type="checkbox" checked={telegramConsent} onChange={(event) => setTelegramConsent(event.target.checked)} /><span>Согласен передать копию заявки в Telegram автору сайта для уведомления. <Link href="/privacy" target="_blank">Подробнее</Link></span></label>
            <button className="button button--lime form-submit" type="submit" disabled={formState === "sending"}>{formState === "sending" ? "Отправляю…" : "Отправить заявку"}<span aria-hidden="true">↗</span></button>
            <p className={`form-feedback ${formState}`} role="status" aria-live="polite">
              {formMessage}
            </p>
          </form>
        </div>
      </section>

      <footer className="site-footer">
        <BrandLink href="#top" />
        <p>Фотография и нейрофотосессии<br />Ноябрьск · Ханты-Мансийск · Сургут<br />Нягань · Москва · онлайн</p>
        <nav aria-label="Контакты и ссылки">
          <a href={site.vkUrl} target="_blank" rel="noreferrer"><svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.3 7.2h3.1c.2 4.1 1.9 5.8 3.2 6.2V7.2h2.9v3.5c1.3-.2 2.7-1.8 3.2-3.5h2.9a8.2 8.2 0 0 1-2.9 4.8c1.2.6 2.8 2.1 3.7 4.8h-3.2c-.6-1.6-2.1-3.1-3.7-3.3v3.3h-.4c-5.1 0-8-3.5-8.8-9.6Z" /></svg>ВКонтакте ↗</a>
          <a href={site.instagramUrl} target="_blank" rel="noreferrer"><svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.7" cy="6.6" r="1.1" fill="currentColor"/></svg>{site.instagramHandle}<sup>*</sup> ↗</a>
          <a href={`tel:${site.phoneHref}`}>тел: {site.phone}</a>
          <Link href="/auth">Личный кабинет</Link><Link href="/admin">Админ-панель</Link><Link href="/privacy">Политика данных</Link>
        </nav>
        <small className="social-disclaimer">* Instagram принадлежит Meta Platforms Inc., признанной экстремистской организацией, деятельность которой запрещена в России.</small>
        <span className="copyright">© 2026</span>
      </footer>

      {activeImage && lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Работа: ${activeImage.title}`} onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Закрыть просмотр">×</button>
          <button className="lightbox-prev" onClick={(event) => { event.stopPropagation(); setLightbox((lightbox - 1 + gallery.length) % gallery.length); }} aria-label="Предыдущая работа">←</button>
          <div className="lightbox-image" onClick={(event) => event.stopPropagation()}>
            <Image src={activeImage.src} alt={activeImage.title} fill sizes="90vw" unoptimized />
          </div>
          <div className="lightbox-info"><span>{activeImage.title}</span><a href={activeImage.src} download>Скачать пример ↓</a></div>
          <button className="lightbox-next" onClick={(event) => { event.stopPropagation(); setLightbox((lightbox + 1) % gallery.length); }} aria-label="Следующая работа">→</button>
        </div>
      )}
    </main>
  );
}
