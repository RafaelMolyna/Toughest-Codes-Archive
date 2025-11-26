
select 
	w.departamento,
	w.divisao,
	w.media
from (
	select 
		y.departamento,
		y.divisao,
		y.media,
		max(y.media) over (partition by y.departamento) as max_media
	from (
		select
			x.departamento,
			x.divisao,
			round(avg(x.salario), 2) as media
		from (
			select 
				e.matr,
				e.nome,
				dep.nome as departamento,
				div.nome as divisao,
				coalesce(ev.venc_t, 0) - coalesce(ed.desc_t, 0) as salario
			from empregado e 

				left join divisao div 
					on div.cod_divisao = e.lotacao_div

				left join departamento dep 
					on dep.cod_dep = e.lotacao

				left join (
					select 
						v.matr,
						sum(v.ven) as venc_t
					from (
						select ev.matr, v.valor ven
						from emp_venc ev join vencimento v
							on ev.cod_venc = v.cod_venc
					) as v
					group by v.matr
				) ev 
					on e.matr = ev.matr

				left join (
					select 
						d.matr,
						sum(d.des) as desc_t
					from (
						select  ed.matr, d.valor des
						from emp_desc ed join desconto d
							on ed.cod_desc = d.cod_desc
					) as d
					group by d.matr
				) ed 
					on e.matr = ed.matr
		) as x
		group by x.departamento, x.divisao
	) as y
) as w
where w.media = w.max_media
order by w.media desc;
