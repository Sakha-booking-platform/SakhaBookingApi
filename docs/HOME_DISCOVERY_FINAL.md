# Home & Discovery API

هذه التعديلات تخص الصفحة الرئيسية فقط.

## Clinics

### GET /api/v1/clinics
إرجاع العيادات فقط.

Query:
- page
- limit
- lat (اختياري)
- lng (اختياري)

إذا أُرسلت `lat/lng` معًا يتم إرجاع `distanceKm`. يمكن تنفيذ الطلب بدون GPS.

### GET /api/v1/clinics/search
بحث وفلترة العيادات.

Query:
- search
- specializationId
- lat (اختياري، مطلوب فقط إذا كانت عبارة البحث تطلب القرب من الموقع)
- lng
- page
- limit

أمثلة:
- `search=الشفاء`
- `search=اسنان`
- `search=احمد اسنان` → في العيادات يتم فهم تخصص أسنان، ولا يشترط أن يكون أحمد جزءًا من اسم العيادة.
- `search=اريد عيادة اسنان قريبة من موقعي&lat=13.5795&lng=44.0209`

كل نتيجة بحث ترجع `matchedFields` للـ highlight في Flutter.

### GET /api/v1/clinics/nearby
العيادات الأقرب.

Query:
- lat (إجباري)
- lng (إجباري)
- search (اختياري)
- specializationId (اختياري)

يرتب حسب `distanceKm` ويرجع حالة التوفر بدل Doctor Avatars.

## Doctors

### GET /api/v1/doctors
إرجاع أفضل الأطباء، مرتبين افتراضيًا حسب التقييم.

Query:
- page
- limit

### GET /api/v1/doctors/search
بحث وفلترة الأطباء مع البحث الذكي.

Query:
- search
- specializationId
- sortBy=rating
- page
- limit

البحث يدعم:
- اسم الطبيب
- التخصص
- اسم العيادة/المركز
- المدينة/الموقع
- الاسم + التخصص معًا مثل `احمد اسنان`
- عبارات مثل `طبيب اسنان اعلى تقييما`

التقييم يستخدم للترتيب فقط وليس كنص بحث.
كل نتيجة ترجع `matchedFields` للـ highlight في Flutter.

## Arabic Search

يتم تجاهل التشكيل والتطويل، وتوحيد اختلافات الهمزات مثل `أحمد/احمد` و`الأمل/الامل`.

## Database patch

قبل التشغيل على قاعدة بيانات لم تُعدّل سابقًا:

```powershell
Get-Content .\database\home_discovery_patch.sql | docker exec -i sakha_postgres psql -U sakha_user -d sakha_db
```

لا توجد بيانات Demo داخل هذه النسخة. جميع responses تأتي من بيانات PostgreSQL الفعلية.


## Nearby contract (final)

`GET /api/v1/clinics/nearby` accepts **only** `lat` and `lng`. It does not accept search or specialization filters.

Natural-language searches such as `عيادة اسنان قريبة من موقعي` are handled by `GET /api/v1/clinics/search`, where `search` carries the phrase and `lat`/`lng` carry the user's GPS position.
