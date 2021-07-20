import express, { Request } from 'express';
import { query, queryReturnType } from '@database';

export type TableDataReturnType = {
    datasets: {
        header: Array<any>;
        body: Array<any>;
        totalData: number;
        currentPage: number;
    };
};

class Base {
    async SetListing(req: Request, qData: queryReturnType, filter: { arrSortColumn: string[]; arrSortType: string[]; arrSearchData: any }): Promise<TableDataReturnType> {
        const result: TableDataReturnType = {
            datasets: {
                header: [],
                body: [],
                totalData: 0,
                currentPage: 1,
            },
        };

        try {
            let tempQData = qData;

            result.datasets.header = [...qData.arrColumn];

            if (filter.arrSortColumn.length || filter.arrSearchData.length) {
                const { queryString } = qData;

                let tempQueryString = '';
                const tempArrSort = [];
                const arrParams = [];

                if (filter.arrSearchData.length) {
                    let whereQueryString = '';
                    for (let x = 0; x < filter.arrSearchData.length; x++) {
                        const search = filter.arrSearchData[x];

                        if (isNaN(search.value)) {
                            whereQueryString += ` and ${search.column} ilike $${x + 1} `;
                            arrParams.push(`%${search.value}%`);
                        }

                        if (!isNaN(search.value)) {
                            whereQueryString += ` and ${search.column} = $${x + 1} `;
                            arrParams.push(search.value);
                        }
                    }

                    tempQueryString += ` where 1 = 1 ${whereQueryString} `;
                }

                if (filter.arrSortColumn.length || filter.arrSortType.length) {
                    for (let x = 0; x < filter.arrSortColumn.length; x++) {
                        const column = filter.arrSortColumn[x];
                        tempArrSort.push(`${column} ${filter.arrSortType[x]}`);
                    }

                    tempQueryString += ` order by ${tempArrSort.join(', ')} `;
                }

                const newQuery = `select * from (${queryString}) as x ${tempQueryString}`;

                tempQData = await query(newQuery, arrParams, req.datasource.admin);
            }

            if (tempQData.rowCount) {
                for (let i = 0; i < tempQData.arrColumn.length; i++) {
                    const column = tempQData.arrColumn[i];
                    const body = [];
                    for (let x = 0; x < tempQData.rowCount; x++) {
                        const rows = tempQData.rows[x];
                        body.push(rows[column]);
                    }
                    result.datasets.body.push(body);
                }
            }

            result.datasets.totalData = tempQData.rowCount;
            result.datasets.currentPage = 1;
        } catch (error) {
            console.log(`${error.message} Base.SetListing`);
        }

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async GetFormData(qData: any) {
        const result: any = {};
        if (qData.rowCount) {
            for (let x = 0; x < qData.arrColumn.length; x++) {
                const column = qData.arrColumn[x];
                result[column] = qData.rows[0][column];
            }
        }

        return result;
    }
}

export default Base;
