import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center py-2 gap-2 z-10">
            <div className="text-center font-bold pb-1 pt-4">
                <Skeleton className="w-[350px] h-[30px] rounded" />
            </div>
            <div className="text-center font-bold pb-4 pt-3">
                <Skeleton className="w-[300px] h-[20px] rounded" />
            </div>
            <div className="px-6 mx-auto">
                <Table className="overflow-hidden">
                    <TableHeader>
                        <TableRow>
                            <TableHead colSpan={6} className="text-center">
                                <Skeleton className="w-[500px] h-[10px] rounded mx-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <TableRow key={idx}>
                                <TableCell colSpan={10} className="flex justify-start gap-2 pt-8">
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                    <Skeleton className="w-[100px] h-[100px] rounded" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableCaption>
                        <Skeleton className="w-[350px] h-[10px] rounded" />
                    </TableCaption>
                </Table>
                <div className="flex justify-center gap-4 py-6"></div>
            </div>
        </div>
    )
}
