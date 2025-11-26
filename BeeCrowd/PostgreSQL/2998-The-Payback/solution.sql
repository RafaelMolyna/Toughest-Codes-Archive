
SELECT
    t.name
    , t.investment
    , min(t.month)
    , min(t.profit_t) AS profit
FROM (

    SELECT
        t.name
        , t.month
		, t.investment
		, t.profit AS profit_m
        , t.cum - t.investment AS profit_t
    FROM (
		SELECT
			c.name
			, c.investment
			, o.month
			, o.profit
			, sum(o.profit) OVER (
				PARTITION BY c.id
				ORDER BY o.month
			) AS cum
		FROM
			operations o
			JOIN clients c
				ON o.client_id = c.id
		ORDER by c.id, o.month
    ) AS t
    WHERE t.cum >= t.investment
    
) AS t
GROUP BY t.name, t.investment
ORDER BY min(t.profit_t) DESC;
