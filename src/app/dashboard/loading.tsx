import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <div className="text-center font-bold pb-1 pt-3">
                <Skeleton className="w-[300px] h-[20px] rounded" />
            </div>
            <div className="text-center font-bold pb-1 pt-3">
                <Skeleton className="w-[300px] h-[20px] rounded" />
            </div>
            <div className="px-6 mx-auto">
                <Table className="overflow-hidden">
                    <TableCaption>
                        <Skeleton className="w-[150px] h-[20px] rounded" />
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead colSpan={2} className="text-center">
                                <Skeleton className="w-[300px] h-[20px] rounded" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <TableRow key={idx}>
                                <TableCell>
                                    <Skeleton className="w-full h-[20px] rounded" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="w-full h-[20px] rounded" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex justify-center gap-4 py-6"></div>
            </div>
        </div>
    )
}
