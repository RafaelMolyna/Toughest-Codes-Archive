with
  l as (
    select
      name,
      customers_number
    from
      lawyers
  )
select
  name,
  customers_number
from
  (
    select
      name,
      customers_number,
      2 as f
    from
      l
    where
      customers_number = (
        select
          min(customers_number)
        from
          l
      )
    union all
    select
      name,
      customers_number,
      1 as f
    from
      l
    where
      customers_number = (
        select
          max(customers_number)
        from
          l
      )
    union all
    select
      'Average',
      round(avg(customers_number), 0),
      3 as f
    from
      l
  ) t
order by
  f;