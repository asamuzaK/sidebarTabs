EN | [JA](./README.ja.md) | [پارسی](./README.fa.md)

[![build](https://github.com/asamuzaK/sidebarTabs/workflows/build/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3Abuild)
[![CodeQL](https://github.com/asamuzaK/sidebarTabs/workflows/CodeQL/badge.svg)](https://github.com/asamuzaK/sidebarTabs/actions?query=workflow%3ACodeQL)
<!--
[![devDependency Status](https://david-dm.org/asamuzaK/sidebarTabs/dev-status.svg)](https://david-dm.org/asamuzaK/sidebarTabs?type=dev)
-->
[![Mozilla Add-on](https://img.shields.io/amo/v/sidebarTabs@asamuzak.jp.svg)](https://addons.mozilla.org/firefox/addon/sidebartabs/)

# زبانه های افقی

افزونه ای برای فایرفاکس 
که زبانه ها را به صورت افقی در کنار صفحه قرار میدهد...
* نمایش زبانه ها به صورت افقی.
* گروه‌بندی کردن زبانه ها و جمع/باز کردنشان.

## دریافت

* [زبانه های افقی – افزونه ای برای فایرفاکس](https://addons.mozilla.org/firefox/addon/sidebartabs/ "Sidebar Tabs – Add-ons for Firefox")

## about:config

برخی از ویژگی های آزمایشی فایرفاکس در این افزونه به کار رفته اند. بنابراین برای استفاده کامل از این افزونه (مثلاً برای قابلیت پوسته تاریک)،‌ باید این کار را انجام بدهید: 
* مقدار `svg.context-properties.content.enabled` را روی `true` تنظیم کنید.

## گروه‌بندی زبانه ها

* زبانه های موردنظر را با "شیفت + کلیک چپ" یا "کنترل + کلیک چپ" ("کامند + کلیک چپ" در مک) روی هر زبانه انتخاب کنید.
* یکی از زبانه های انتخاب شده را با "شیفت + کلیک چپ" بکشید و روی زبانه ای که میخواهید گروه بندی کنید بندازید.
* همچنین شما میتوانید با انتخاب گزینه "گروه‌ زبانه" از فهرست راست کلیک و سپس انتخاب گزینه "گروه‌بندی زبانه های انتخاب شده" عمل گروه‌بندی را انجام بدهید.
* گروه زبانه ها هر کدام رنگ‌بندی خاص خودشان را دارند.
* گروه زبانه ها را میتوان با کلیک کردن روی بخش رنگی و یا از فهرست راست کلیک جمع/باز کرد.
* زبانه جدیدی که از یک زبانه داخل گروه باز بشود،‌ عضوی از همان گروه زبانه خواهد شد.
* برای لغو گروه زبانه، میتوانید از فهرست راست کلیک اقدام کنید.
* گروه زبانه ها در صفحات خصوصی (Private window) ذخیره نخواهند شد.

## مشکلات موجود
* امکان پنهان کردن زبانه های خود مرورگر وجود ندارد زیرا API (واسط برنامه‌نویسی) برای این کار در افزونه ها تعبیه نشده است اما شما میتوانید به صورت دستی این کار را انجام بدهید.
  [مشکل #5](https://github.com/asamuzaK/sidebarTabs/issues/5 "افزودن قابلیت \"پنهان کردن زبانه های خود مرورگر\" · مشکل #5 · asamuzaK/sidebarTabs")
  
* گزینه "فرستادن زبانه به دستگاه دیگر" از فهرست راست کلیک اصلی در این افزونه تعبیه نشده است زیرا API (واسط برنامه‌نویسی) برای آن در افزونه ها وجود ندارد.
  [مشکل #7](https://github.com/asamuzaK/sidebarTabs/issues/7 "افزودن قابلیت \"فرستادن زبانه به دستگاه دیگر\" · Issue #7 · asamuzaK/sidebarTabs")
