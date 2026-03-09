-- Function to search dental laboratories
CREATE OR REPLACE FUNCTION search_dental_laboratories(
    search_query TEXT,
    specialty_filter TEXT DEFAULT NULL,
    city_filter TEXT DEFAULT NULL
) RETURNS SETOF dental_laboratories AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM dental_laboratories
    WHERE
        (search_query IS NULL OR search_query = '' OR 
         lab_name ILIKE '%' || search_query || '%' OR 
         city ILIKE '%' || search_query || '%')
        AND
        (specialty_filter IS NULL OR specialty_filter = '' OR 
         specialty_filter = ANY(specialties))
        AND
        (city_filter IS NULL OR city_filter = '' OR 
         city = city_filter);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
