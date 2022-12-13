[EN](./README.md) | [JA](./README.ja.md) | پارسی

[![build](https://github.com/asamuzaK/sidebarTabs/workflows/build/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/sidebarTabs/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3ACodeQL)
<!--
[![devDependency Status](https://david-dm.org/asamuzaK/sidebarTabs/dev-status.svg)](https://david-dm.org/asamuzaK/sidebarTabs?type=dev)
-->
[![Mozilla Add-on](https://img.shields.io/amo/v/sidebarTabs@asamuzak.jp.svg)](https://addons.mozilla.org/firefox/addon/sidebartabs/)

# زبانه‌های افقی

افزونه‌ای برای فایرفاکس 
که زبانه‌ها را به صورت افقی در کنار صفحه قرار می‌دهد...
* نمایش زبانه‌ها به صورت افقی.
* گروه‌بندی کردن زبانه‌ها و جمع/باز کردنشان.

## دریافت

* [زبانه‌های افقی – افزونه‌ای برای فایرفاکس](https://addons.mozilla.org/firefox/addon/sidebartabs/ "Sidebar Tabs – Add-ons for Firefox")

## about:config

برخی از ویژگی‌های آزمایشی فایرفاکس در این افزونه به کار رفته‌اند. بنابراین برای استفاده کامل از این افزونه (مثلاً برای قابلیت پوسته تاریک)،‌ باید این کار را انجام بدهید: 
* مقدار `svg.context-properties.content.enabled` را روی `true` تنظیم کنید.

این کار میتواند باعث بهبود پوسته تاریک هم بشود ([مشکل #۱۵۴](https://github.com/asamuzaK/sidebarTabs/issues/154)).

## گروه‌بندی زبانه‌ها

* زبانه‌های موردنظر را با "شیفت + کلیک چپ" یا "کنترل + کلیک چپ" ("کامند + کلیک چپ" در مک) روی هر زبانه انتخاب کنید.
* یکی از زبانه‌های انتخاب شده را با "شیفت + کلیک چپ" بکشید و روی زبانه ای که میخواهید گروه‌بندی کنید، بندازید.
* همچنین شما می‌توانید با انتخاب گزینه "گروه‌ زبانه" از فهرست راست کلیک و سپس انتخاب گزینه "گروه‌بندی زبانه‌های انتخاب شده" عمل گروه‌بندی را انجام بدهید.
* گروه زبانه‌ها هر کدام رنگ‌بندی خاص خودشان را دارند.
* گروه زبانه‌ها را می‌توان با کلیک کردن روی بخش رنگی و یا از فهرست راست کلیک جمع/باز کرد.
* زبانه جدیدی که از یک زبانه داخل گروه باز بشود،‌ عضوی از همان گروه زبانه خواهد شد.
* برای لغو گروه زبانه، میتوانید از فهرست راست کلیک اقدام کنید.
* گروه زبانه‌ها در صفحات خصوصی (Private window) ذخیره نخواهند شد.

## مشکلات موجود
* امکان پنهان کردن زبانه‌های خود مرورگر وجود ندارد زیرا API (واسط برنامه‌نویسی) برای این کار در افزونه‌ها تعبیه نشده است اما شما می‌توانید به صورت دستی این کار را انجام بدهید.
  [مشکل #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "افزودن قابلیت \"پنهان کردن زبانه‌های خود مرورگر\" · مشکل #5 · asamuzaK/sidebarTabs")
* گزینه "فرستادن زبانه به دستگاه دیگر" از فهرست راست کلیک اصلی در این افزونه تعبیه نشده است زیرا API (واسط برنامه‌نویسی) برای آن در افزونه‌ها وجود ندارد.
  [مشکل #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "افزودن قابلیت \"فرستادن زبانه به دستگاه دیگر\" · Issue #7 · asamuzaK/sidebarTabs")
