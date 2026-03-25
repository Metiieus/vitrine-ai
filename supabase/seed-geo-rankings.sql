-- Seed dados de geo_rankings para Casa da Pizza

insert into public.geo_rankings (business_id, keyword, grid_row, grid_col, rank, neighborhood, last_checked_at)
select b.id, kw.keyword, r.row, r.col, r.rank, r.neighborhood, now()
from public.businesses b
cross join (
  select unnest(array[
    'pizzaria em Moema',
    'pizza artesanal São Paulo',
    'melhor pizza Moema',
    'restaurante pizza zona sul',
    'pizza delivery Moema'
  ]) as keyword
) kw
cross join (
  -- Gerar grid 7x7 com rankings realistas
  select 
    row,
    col,
    case 
      when row = 3 and col = 3 then 2  -- Centro (sua localização)
      when row in (2,3,4) and col in (2,3,4) then (abs(row-3) + abs(col-3)) * 3 + 1
      when row in (1,2,3,4,5) and col in (1,2,3,4,5) then (abs(row-3) + abs(col-3)) * 4 + 2
      else (abs(row-3) + abs(col-3)) * 5 + 3
    end as rank,
    case
      when row = 0 and col = 0 then 'Vila Olímpia (NE-NO)'
      when row = 0 and col = 3 then 'Itaim Bibi (Norte)'
      when row = 0 and col = 6 then 'Brooklin Nord (NE-NE)'
      when row = 3 and col = 0 then 'Vila Olímpia (NO)'
      when row = 3 and col = 3 then 'Moema (Centro)'
      when row = 3 and col = 6 then 'Santo André (SE)'
      when row = 6 and col = 0 then 'Pinheiros (SO)'
      when row = 6 and col = 3 then 'Jabaquara (Sul)'
      when row = 6 and col = 6 then 'Diadema (SE-SO)'
      else 'Zona Adjacente'
    end as neighborhood
  from generate_series(0, 6) as s(row), generate_series(0, 6) as c(col)
) r
where b.name = 'Casa da Pizza - Vila Mariana'
on conflict (business_id, keyword, grid_row, grid_col) 
do update set rank = excluded.rank, last_checked_at = now();
