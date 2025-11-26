SELECT
    c.name,
    p.sum
FROM
    categories c
    JOIN (
        SELECT
            p.id_categories,
            SUM(p.amount) sum
        FROM
            products p
        GROUP BY
            p.id_categories
    ) AS p ON p.id_categories = c.id;
