import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse'; // sync 모듈을 사용하지 않고 async 모듈만 사용

@Injectable()
export class ExcelService {
  async readExcelAndGenerateSQL(buffer: Buffer): Promise<string> {
    try {
      const csvString = buffer.toString('utf-8');
      const records = await this.parseCSV(csvString);
      console.log(records); // 디버깅을 위한 콘솔 로그

      // SQL 쿼리문 생성
      const insertStatement = records.map((row: any) => {
        const query = `
        INSERT INTO bi18_fax (dates, china_to_north_america, china_to_north_europe, north_europe_to_north_america, asia_southern_to_north_america, asia_southern_to_europe)
        VALUES (
          '${row['dates']}',
          ${row['china to north america'] || 'NULL'},
          ${row['china to north europe'] || 'NULL'},
          ${row['north europe to north america'] || 'NULL'},
          ${row['asia(southern) to north america'] || 'NULL'},
          ${row['asia(southern) to europe'] || 'NULL'}
        )
        ON DUPLICATE KEY UPDATE
          china_to_north_america = VALUES(china_to_north_america),
          china_to_north_europe = VALUES(china_to_north_europe),
          north_europe_to_north_america = VALUES(north_europe_to_north_america),
          asia_southern_to_north_america = VALUES(asia_southern_to_north_america),
          asia_southern_to_europe = VALUES(asia_southern_to_europe);
      `;
        return query;
      });

      return insertStatement.join('\n');
    } catch (error) {
      console.log('Error processing file:', error);
      throw new Error('Error processing file');
    }
  }

  // CSV 파싱 메소드
  private parseCSV(csvString: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records: any[] = [];
      parse(csvString, {
        columns: true,
        skip_empty_lines: true,
      })
        .on('data', (row) => {
          records.push(row);
        })
        .on('end', () => {
          resolve(records);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
