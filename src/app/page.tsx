'use client';

import { useState, useEffect, useMemo } from 'react';
import { matrix, tasks } from '@/lib/values';

// Вспомогательные функции для расчётов (из оригинала)
const stringSum = (number: number) => number.toString().split('').reduce(
  (accumulator, currentValue) => accumulator + parseInt(currentValue, 10),
  0
);

const splitInt = (value: string | number) => value
  .toString()
  .replace(/\./g, '')
  .split('')
  .map(x => parseInt(x));

// Функция получения значения матрицы (из оригинала)
const getMatrixValue = (fullArray: number[], number: number): string => {
  if (!fullArray.length) {
    return '—';
  }
  const filteredArray = fullArray.filter(x => x === number);
  let valueString;
  if (filteredArray.length > 5) {
    valueString = filteredArray.slice(5).join('');
  } else if (filteredArray.length === 0) {
    valueString = `${number}0`;
  } else {
    valueString = filteredArray.join('');
  }
  return matrix[valueString] || '—';
};

// Получить строку чисел для ячейки матрицы
const getCellNumbers = (fullArray: number[], cellNumber: number, yearDate: number): string => {
  const filteredArray = fullArray.filter(x => x === cellNumber);
  
  if (cellNumber === 9 && yearDate >= 2020) {
    filteredArray.push(9);
  }
  
  if (filteredArray.length === 0) {
    return '—';
  }
  
  return filteredArray.join(' ');
};

export default function Home() {
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/MysticNUM/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const calculatedValues = useMemo(() => {
    if (!date) {
      return { yearDate: 0, secondNumber: '', fourthNumber: '', numberArray: [] as number[], fullArray: [] as number[] };
    }

    const dateObj = new Date(date);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedDate = `${day}.${month}.${year}`;

    const numbers = splitInt(formattedDate);

    const first = numbers.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const second = stringSum(first);
    const third = year >= 2000
      ? first + 19
      : first - ((numbers[0] !== 0 ? numbers[0] : numbers[1]) * 2);
    const fourth = stringSum(third);

    let numberArray: number[];
    let fullArray: number[];

    if (year >= 2000) {
      numberArray = [first, second, 19, third, fourth];
      fullArray = [...numbers, ...splitInt(first), ...splitInt(second), ...splitInt(19), ...splitInt(third), ...splitInt(fourth)];
    } else {
      numberArray = [first, second, third, fourth];
      fullArray = [...numbers, ...splitInt(first), ...splitInt(second), ...splitInt(third), ...splitInt(fourth)];
    }

    return { yearDate: year, secondNumber: second.toString(), fourthNumber: fourth.toString(), numberArray, fullArray };
  }, [date]);

  const { yearDate, secondNumber, fourthNumber, numberArray, fullArray } = calculatedValues;

  const matrixLayout = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm z-50">
          Офлайн режим
        </div>
      )}

      <div className="max-w-sm mx-auto my-4 px-4">
        <div className="space-y-4">
          <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>Дата рождения</h6>
          <input
            id="date"
            type="date"
            value={date}
            onChange={e => { setDate(e.target.value); setError(e.target.validationMessage); }}
            className="w-full border-b border-gray-400 py-2 text-base focus:outline-none focus:border-indigo-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Доп. числа: <span className="text-indigo-500">{numberArray.join('.')}</span>
          </h6>

          <h6 className="text-base font-normal" style={{ fontFamily: 'Roboto, sans-serif' }}>Матрица</h6>

          <table className="w-full border-collapse">
            <tbody>
              {matrixLayout.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const cellNumbers = getCellNumbers(fullArray, cell, yearDate);
                    const hasNumbers = cellNumbers !== '—';
                    return (
                      <td key={colIndex} className="border border-black relative" style={{ width: '33.33%' }}>
                        <div className="relative pb-[100%]">
                          <span className="absolute top-1 left-1 text-gray-400 text-sm">{cell}</span>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-bold ${hasNumbers ? 'text-indigo-600' : 'text-gray-300'}`}>
                              {cellNumbers}
                            </span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!!fullArray.length && (
        <div className="max-w-md mx-auto my-4 px-4">
          <div className="space-y-4">
            <h6 className="text-base font-normal">Личная задача Души</h6>
            <p className="text-base whitespace-pre-wrap">{secondNumber ? tasks[secondNumber] : null}</p>

            <h6 className="text-base font-normal">Родовая задача. ЧРП</h6>
            <p className="text-base whitespace-pre-wrap">{fourthNumber ? tasks[fourthNumber] : null}</p>

            <h6 className="text-base font-normal">Значения матрицы</h6>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
              const matrixValue = getMatrixValue(fullArray, digit);
              const count = fullArray.filter(x => x === digit).length;
              return (
                <div key={digit} className="mb-4">
                  <p className="text-sm font-medium mb-2">
                    <strong>Значение цифры {digit}</strong>
                    {count > 0 && <span className="text-indigo-600 ml-2">({count} шт)</span>}
                  </p>
                  <p className="text-base whitespace-pre-wrap">{matrixValue}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
