-- ==============================================================================
-- جدول طلبات إضافة الفلل (Villa Onboarding Requests)
-- يتم من خلاله تقديم أصحاب الفلل لطلبات إدراج فلل جديدة لمراجعتها ومعاينتها
-- ==============================================================================

create table if not exists public.villa_requests (
  id uuid not null default gen_random_uuid(),
  manager_id uuid not null references public.managers(id) on delete cascade,
  
  -- المعلومات الأساسية
  name text not null,
  description text not null,
  address text not null,
  -- المدينة والعنوان
  city text not null default 'أريحا',
  city_id uuid null references public.cities(id) on delete set null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  
  -- السعة والمواصفات
  max_guests integer not null default 1,
  num_bedrooms integer not null default 1,
  num_bathrooms integer not null default 1,
  
  -- أوقات الدخول والخروج والقواعد
  check_in_time text null,
  check_out_time text null,
  house_rules text null,
  
  -- جهات الاتصال
  display_contact_number text null,
  owner_phone_number text null,
  
  -- الأسعار والعملة
  currency text not null default 'ILS',
  currency_id uuid null references public.currencies(id) on delete set null,
  start_of_week_price numeric(10, 2) null,
  midweek_price_per_night numeric(10, 2) null,
  weekend_price_per_night numeric(10, 2) null,
  
  -- جدول تصنيف الأيام (السبت - الجمعة)
  day_classifications jsonb null default '{
    "saturday": "weekend",
    "sunday": "start_of_week",
    "monday": "midweek",
    "tuesday": "midweek",
    "wednesday": "midweek",
    "thursday": "weekend",
    "friday": "weekend"
  }'::jsonb,
  
  -- المرافق والخدمات (مصفوفة)
  amenities text[] null default '{}',
  
  -- الصور المرفوعة
  image_urls text[] null default '{}',
  
  -- حالة الطلب وملاحظات الإدارة
  status text not null default 'pending', -- pending (قيد المراجعة) | inspection (قيد المعاينة) | approved (معتمد) | rejected (مرفوض)
  admin_notes text null,
  rejection_reason text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  constraint villa_requests_pkey primary key (id)
);

-- تفعيل سياسات الأمان على مستوى السجل RLS
alter table public.villa_requests enable row level security;

-- السماح للمدير برؤية طلباته فقط
create policy "Managers can view own villa requests"
  on public.villa_requests for select
  using (
    manager_id in (
      select id from public.managers where profile_id = auth.uid()
    )
  );

-- السماح للمدير بإنشاء طلبات لنفسه
create policy "Managers can insert own villa requests"
  on public.villa_requests for insert
  with check (
    manager_id in (
      select id from public.managers where profile_id = auth.uid()
    )
  );

-- السماح للمدير بتعديل طلباته إذا كانت لا تزال قيد المراجعة
create policy "Managers can update own pending villa requests"
  on public.villa_requests for update
  using (
    manager_id in (
      select id from public.managers where profile_id = auth.uid()
    ) and status in ('pending', 'rejected')
  );
