SELECT
    v.name,
    v.price
FROM
    (
        SELECT
            v.name,
            v.id,
            CASE
                WHEN v.type = 'A' THEN 20.0
                WHEN v.type = 'B' THEN 70.0
                ELSE 530.5
            END as price
        FROM
            products v
    ) as v
ORDER by
    v.price,
    v.id DESC;
