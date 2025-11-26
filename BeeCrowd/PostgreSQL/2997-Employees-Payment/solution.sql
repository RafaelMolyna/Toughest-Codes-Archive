/**
* Escreva a sua solução aqui
* Code your solution here
* Escriba su solución aquí
*/

select
	x.dep "Departamento",
	x.nome "Empregado",
	case when max(x.bru)=0 then 0 else max(x.bru) end as "Salario Bruto",
	case when max(x.des)=0 then 0 else max(x.des) end as "Total Desconto",
	case when max(x.liq)=0 then 0 else round(max(x.liq), 2) end as "Salario Liquido"
from (
	select
		dep.nome as dep,
		e.nome as nome,
		round(coalesce(ev.venc_t, 0), 2) as bru,
		round(coalesce(ed.desc_t, 0), 2) as des,
		coalesce(ev.venc_t, 0) - coalesce(ed.desc_t, 0) as liq,
		e.lotacao_div as n_div,
		e.lotacao as n_dep
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
group by x.dep, x.n_div, x.nome
order by max(x.liq) desc;
