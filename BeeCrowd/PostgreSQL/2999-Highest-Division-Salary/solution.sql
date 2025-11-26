select 
	e.nome,
	coalesce(ev.venc_t, 0) - coalesce(ed.desc_t, 0) as salario
from empregado e 

	inner join divisao div 
		on div.cod_divisao = e.lotacao_div

	inner join departamento dep 
		on dep.cod_dep = e.lotacao

	join (
		select 
			e.matr,
			coalesce(sum(v.valor), 0) as venc_t
		from 
			empregado e 
			left join
				emp_venc ev 
				join vencimento v
					on ev.cod_venc = v.cod_venc
			on e.matr = ev.matr
		group by e.matr
	) ev 
		on e.matr = ev.matr

	join (
		select 
			e.matr,
			coalesce(sum(d.valor), 0) as desc_t
		from
			empregado e 
			left join
				emp_desc ed 
				join desconto d
					on ed.cod_desc = d.cod_desc
			on
				e.matr = ed.matr
		group by e.matr
	) ed 
		on e.matr = ed.matr
where 
	ev.venc_t - ed.desc_t >= 8000
group by 
	e.lotacao_div,
	e.nome, 
	ev.venc_t, 
	ed.desc_t
having 
	ev.venc_t - ed.desc_t >= avg(ev.venc_t - ed.desc_t)
order by 
	e.lotacao_div;

