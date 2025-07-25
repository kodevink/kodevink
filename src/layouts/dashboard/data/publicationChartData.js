export const getPublicationChartData = (publications) => {
    // Define the range of years (last 10 years)
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 9;
    const years = Array.from({ length: 10 }, (_, i) => startYear + i);

    // Chart 1: Publications per Year
    const publicationsPerYear = years.map(year => ({
        year,
        count: publications.filter(pub => pub.publication_year === year).length,
    }));

    // Chart 2: Verified vs. Pending Publications per Year
    const verifiedPerYear = years.map(year => ({
        year,
        count: publications.filter(pub => pub.publication_year === year && pub.verification_status === 'verified').length,
    }));
    const pendingPerYear = years.map(year => ({
        year,
        count: publications.filter(pub => pub.publication_year === year && pub.verification_status === 'pending').length,
    }));

    return {
        publicationsPerYear: {
            labels: years.map(year => year.toString()),
            datasets: {
                label: "Publications",
                data: publicationsPerYear.map(item => item.count),
            },
        },
        verificationStatus: {
            labels: years.map(year => year.toString()),
            datasets: [
                {
                    label: "Verified",
                    data: verifiedPerYear.map(item => item.count),
                    color: "success",
                },
                {
                    label: "Pending",
                    data: pendingPerYear.map(item => item.count),
                    color: "warning",
                },
            ],
        },
    };
};